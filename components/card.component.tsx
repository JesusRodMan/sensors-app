import { Card, CardMedia, CardContent, CardActionArea, Typography } from '@mui/material';
import Link from 'next/link';

interface CardProps {
    image: string;
    text: string;
    href: string;
}

const CardComponent: React.FC<CardProps> = ({ image, text, href }) => {
    return (
        <div className="cardWrapper">
            <Link href={href} passHref>
                <Card
                    component="a"
                >
                    <CardActionArea>
                        <CardMedia
                            component="img"
                            style={{ width: '100%' }}
                            image={image}
                            alt={text}
                        />
                        <CardContent style={{ textAlign: 'center' }}>
                            <Typography gutterBottom variant="h4" component="div" fontWeight="bold">
                                {text}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Link>
        </div>
    );
};

export default CardComponent;
